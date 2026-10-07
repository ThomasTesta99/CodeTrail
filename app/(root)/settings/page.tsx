import ChangeName from "@/components/settings/ChangeName";
import EmailSettings from "@/components/settings/EmailSettings";
import { SettingsButton, SettingsRow, SettingsSection } from "@/components/settings/SettingsHelpers";
import { getUserSession } from "@/lib/user-actions/authHelpers";
import { redirect } from "next/navigation";

const page = async () => {
    const session = await getUserSession();
    const user = session?.user;

    if (!user) {
        redirect("/");
    }

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

                    <SettingsSection title="Sign-in & Security">
                        <SettingsRow
                            title="Password"
                            description="Change the password used to sign in to your account."
                            action={
                                <SettingsButton>
                                    Change password
                                </SettingsButton>
                            }
                        />

                        <SettingsRow
                            title="Active sessions"
                            description={
                                <>
                                    Sign out of CodeTrail on all other devices
                                    while keeping this session active.
                                </>
                            }
                            action={
                                <SettingsButton>
                                    Sign out other sessions
                                </SettingsButton>
                            }
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
                            action={
                                <SettingsButton danger>
                                    Delete account
                                </SettingsButton>
                            }
                        />
                    </SettingsSection>
                </div>
            </div>
        </main>
    );
};

export default page;