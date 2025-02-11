export const random = (len : number) => {
    let options = "qwertyuioplkjhgfdsazxcvbnm1234567890";
    const length = options.length;
    let ans = "";
    for(let i = 0; i < len; i++) {
        ans += options[Math.floor(Math.random() * length)];
    }
    return ans;
}