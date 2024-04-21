
function getWholePercent(percentFor, percentOf) {
    return Math.floor(percentFor / percentOf * 100);
}
function genrateLabelList(label, length) {
    var labels = [];
    while (length > 0) {
        labels.push(label);
        length--;
    }
    return labels;
}