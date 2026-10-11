import ChangeName from "@/components/settings/ChangeName";
import ChangePassword from "@/components/settings/ChangePassword";
import DeleteAccount from "@/components/settings/DeleteAccount";
import EmailSettings from "@/components/settings/EmailSettings";
import SetPassword from "@/components/settings/SetPassword";
import { SettingsButton, SettingsRow, SettingsSection } from "@/components/settings/SettingsHelpers";
import SignOutOtherSessions from "@/components/settings/SignOutOtherSessions";
import UnlinkSocialButton from "@/components/settings/UnlinkButton";
import { isAccountDeletionBlocked } from "@/lib/security/protectedAccount";
import { SOCIAL_PROVIDERS } from "@/lib/socialProviders";
import {  connectSocialAccount, getUserAccounts } from "@/lib/user-actions/authActions";
import { getUserSession } from "@/lib/user-actions/authHelpers";
import Image from "next/image";
import { redirect } from "next/navigation";

const page = async ({searchParams} : {searchParams: Promise<{linkError? : string}>}) => {
    const session = await getUserSession();
    const user = session?.user;

    if (!user) {
        redirect("/");
    }

    const {linkError} = await searchParams;
    const socialConnectionError = linkError === "1"
        ? "Unable to connect your account. Please try again."
        : null;

    const result = await getUserAccounts();
    const accounts = result.success ? result.accounts : [];
    const hasPassword = accounts.some(account => account.providerId === "credential");

    const handleConnectSocial = async (formData: FormData) => {
        "use server";

        const result = await connectSocialAccount({provider: formData.get("provider")});

        if(!result.success){
            redirect("/settings?linkError=1");
        }

        redirect(result.url);
    };

    return (
        <main className="settings-page">
            <div className="settings-wrapper">
                <div className="settings-page-header">
                    <h1 className="settings-page-title">
                        Settings
                    </h1>

                    <p className="settings-page-description">
                        Manage your account and security settings.
                    </p>
                </div>

                <div className="settings-sections">
                    <SettingsSection
                        title="Account"
                        description="Manage your personal account information."
                    >
                        <SettingsRow
                            title="Name"
                            description={user.name || "No name set"}
                            action={
                                <ChangeName currentName={user.name}/>
                            }
                        />


                        <SettingsRow
                            title="Email address"
                            description={user.email}
                            badge={
                                !user.emailVerified ? (
                                <span className="settings-status settings-status-unverified">
                                    Unverified
                                </span>
                                ) : undefined
                            }
                            action={
                                <EmailSettings email={user.email} emailVerified={user.emailVerified}/>
                            }
                        />
                    </SettingsSection>

                    <SettingsSection title="Sign-in & Security" description="Manage how you sign in and protect your account.">
                        <SettingsRow
                            title="Password"
                            description={!result.success
                                ? "Unable to load password settings. Please refresh the page."
                                : hasPassword
                                    ? "Change the password used to sign in to your account."
                                    : "Set a password to enable email and password sign-in."
                            }
                            action={result.success ? (
                                hasPassword ? <ChangePassword/> : <SetPassword/>
                            ) : undefined}
                        />

                        <SettingsRow
                            title="Connected sign-in methods"
                            description={
                                !result.success ? (
                                    <p role="alert" className="text-sm text-red-600">
                                        Unable to load connected sign-in methods. Please refresh the page and try again.
                                    </p>
                                ) : (
                                    <div className="settings-connected-methods-list">
                                        <p className="settings-connected-methods-description">
                                            Manage the methods you can use to sign in to CodeTrail.
                                        </p>

                                        <div className="settings-connected-method">
                                            <div>
                                                <p className="settings-connected-method-title">Email & password</p>
                                                <p className="settings-connected-method-description">
                                                    {hasPassword ? "Sign in using your email address." : "No password configured."}
                                                </p>
                                            </div>

                                            <span className={`settings-status ${hasPassword ? "settings-status-verified" : "settings-status-unverified"}`}>
                                                {hasPassword ? "Connected" : "Not configured"}
                                            </span>
                                        </div>

                                        {SOCIAL_PROVIDERS.map(provider => {
                                            const connected = accounts.some(account => account.providerId === provider.id);

                                            return (
                                                <div key={provider.id} className="settings-connected-method">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-row items-center gap-2">
                                                            {provider.image && (
                                                                <Image src={provider.image} alt={`${provider.name} logo`} width={24} height={24}/>
                                                            )}
                                                            <p className="settings-connected-method-title">{provider.name}</p>
                                                        </div>

                                                        <p className="settings-connected-method-description">
                                                            {connected ? `${provider.name} account connected.` : `Connect your ${provider.name} account to sign in.`}
                                                        </p>

                                                        {connected && accounts.length <= 1 && (
                                                            <p className="settings-connected-method-description">
                                                                Connect another sign-in method before unlinking this one.
                                                            </p>
                                                        )}
                                                    </div>

                                                    {connected ? (
                                                        <div className="flex shrink-0 items-center gap-2">
                                                            <span className="settings-status settings-status-verified">Connected</span>
                                                            <UnlinkSocialButton provider={provider.id} providerName={provider.name} disabled={accounts.length <= 1}/>
                                                        </div>
                                                    ) : (
                                                        <form action={handleConnectSocial}>
                                                            <input type="hidden" name="provider" value={provider.id}/>
                                                            <button type="submit" className="settings-connected-method-action">
                                                                Connect
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {socialConnectionError && (
                                            <p role="alert" className="text-sm text-red-600">
                                                {socialConnectionError}
                                            </p>
                                        )}
                                    </div>
                                )
                            }
                        />

                        <SettingsRow
                            title="Active sessions"
                            description="Sign out of CodeTrail on all other devices and browsers while keeping this session active."
                            action={<SignOutOtherSessions/>}
                        />
                    </SettingsSection>

                    <SettingsSection
                        title="Danger Zone"
                        description="Actions in this section cannot be undone."
                        danger
                    >
                        <SettingsRow
                            title="Delete account"
                            description={
                                <>
                                    Permanently delete your CodeTrail account
                                    and all associated questions, attempts, and
                                    account data. This action cannot be undone.
                                </>
                            }
                            action={isAccountDeletionBlocked(user.id) ? (
                                    <span className="text-sm text-gray-500">
                                        Account deletion disabled
                                    </span>
                                ) : result.success ? (
                                    <DeleteAccount hasPassword={hasPassword}/>
                                ) : undefined
                            }
                        />
                    </SettingsSection>
                </div>
            </div>
        </main>
    );
};

export default page;