// utils for Browser environment only
export function isMobileBrowser() {
    const uaLowerCase = navigator.userAgent.toLowerCase();
    return (
        uaLowerCase.includes("android") ||
        uaLowerCase.includes("harmony") ||
        uaLowerCase.includes("iphone") ||
        uaLowerCase.includes("ipad") ||
        uaLowerCase.includes("mobile")
    );
}
