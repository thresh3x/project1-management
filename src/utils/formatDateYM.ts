export const formatDateYM = (date: Date, format = 'yyyy-MM-dd'): string => {
    const year = date.getFullYear()
    const mouth = date.getMonth() + 1
    const day = date.getDate()
    const formatMap: { [key:string]: any } = {
        yyyy: year.toString(),
        MM: mouth.toString().padStart(2, '0'),
        dd: day.toString().padStart(2, '0')
    }

    return format.replace(/yyyy|MM|dd/g, (match: any) => formatMap[match])
}
