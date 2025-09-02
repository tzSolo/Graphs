export const getDateInString = (time = "now") => {
    const date = new Date();
    let month = date.getMonth();
    if (time == "now") {
        month++;
    }
    return `arrTimeSpent${month}${date.getFullYear()}`;
}

export const DEFUALT_CATEGORIES = [
    {
        domain: /^chrome:\/\//,
        category: "דפי Chrome"
    },
    {
        domain: /^https:\/\/chrome.google.com\/webstore\//,
        category: "החנות של Chrome"
    },
    {
        domain: /^chrome-extension:\/\/mhjfbmdgcfjbbpaeojofohoefgiehjai\/.*\.pdf$/,
        category: "קבצי pdf"
    },
    {
        domain: /^https?:\/\/(www\.)?google\.com\/search/,
        category: "חיפוש ב Google"
    },
    {
        domain: /^https?:\/\/[^\/]+\/mail(?:\/.*)?$/,
        category: "מייל"
    },
{
        domain: /^https?:\/\/[^\/]+\/chat(?:\/.*)?$/,
        category: "צ'אט"
    }
];