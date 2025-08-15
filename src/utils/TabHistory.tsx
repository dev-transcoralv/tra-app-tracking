let tabHistory: string[] = [];

export const pushTab = (tabName: string) => {
  if (tabHistory[tabHistory.length - 1] !== tabName) {
    tabHistory.push(tabName);
  }
};

export const popTab = () => {
  if (tabHistory.length > 1) {
    tabHistory.pop(); // remove current
    return tabHistory[tabHistory.length - 1]; // previous tab
  }
  return null;
};
