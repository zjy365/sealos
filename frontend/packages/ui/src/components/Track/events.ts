export const trackEvents = {
  signinGithub: 'signin_github',
  signinGoogle: 'signin_google',
  signinComplete: (provider: string | undefined) =>
    `signin${provider ? `_${provider.toLowerCase?.()}` : ''}_complete`,
  clickUpgradeInDesktop: 'main_upgrade',
  clickUpgradeInDesktopWorkspace: 'workspace_upgrade',
  purchase: (planName: string) => `${planName?.toLowerCase()}_purchase`,
  checkout: 'checkout',
  lowCreditAlertNoPlan: 'low_credit',
  lowCreditAlertNoPlanClick: 'low_credit_click',
  lowCreditAlert: (planName: string) => `${planName?.toLowerCase()}_low_upgrade`,
  lowCreditAlertClick: (planName: string) => `${planName?.toLowerCase()}_low_upgrade_click`,
  noCreditAlert: (planName: string) => `${planName?.toLowerCase()}_no_upgrade`,
  noCreditAlertClick: (planName: string) => `${planName?.toLowerCase()}_no_upgrade_click`,
  accountCenterUpgrade: (planName: string) => `${planName?.toLowerCase()}_plan_upgrade`,
  accountCenterUpgradeClick: (planName: string) => `${planName?.toLowerCase()}_plan_upgrade_click`
};
