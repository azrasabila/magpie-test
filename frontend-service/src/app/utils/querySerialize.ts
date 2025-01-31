export function serialize(obj: { [key: string]: string }) {
    var str = []
    for (var p in obj)
        if (obj.hasOwnProperty(p) && obj[p] !== '') {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
        }
    return str.join('&')
}