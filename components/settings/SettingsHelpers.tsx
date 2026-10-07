import { SettingsButtonProps, SettingsRowProps, SettingsSectionProps } from "@/types/types";

export const SettingsSection = ({
    title,
    description,
    danger = false,
    children,
}: SettingsSectionProps) => {
    return (
        <section
            className={`settings-section ${
                danger ? "settings-section-danger" : ""
            }`}
        >
            <div
                className={`settings-section-header ${
                    danger ? "settings-section-header-danger" : ""
                }`}
            >
                <h2 className="settings-section-title">
                    {title}
                </h2>

                {description && (
                    <p
                        className={`settings-section-description ${
                            danger
                                ? "settings-section-description-danger"
                                : ""
                        }`}
                    >
                        {description}
                    </p>
                )}
            </div>

            <div className="settings-section-body">
                {children}
            </div>
        </section>
    );
};

export const SettingsRow = ({
    title,
    description,
    badge,
    action,
}: SettingsRowProps) => {
    return (
        <div className="settings-row">
            <div className="settings-row-content">
                <div className="settings-row-heading">
                    <p className="settings-row-title">
                        {title}
                    </p>

                    {badge}
                </div>

                <div className="settings-row-description">
                    {description}
                </div>
            </div>

            {action}
        </div>
    );
};

export const SettingsButton = ({
    children,
    danger = false,
}: SettingsButtonProps) => {
    return (
        <button
            type="button"
            className={`settings-button ${
                danger ? "settings-button-danger" : ""
            }`}
        >
            {children}
        </button>
    );
};