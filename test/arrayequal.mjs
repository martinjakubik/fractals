const intArrayEqual = function (a1, a2) {
    if (a1 === null || a2 === null) return false;
    if (a1.length != a2.length) return false;
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
};

export { intArrayEqual };