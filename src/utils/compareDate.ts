export const compareDate = (time1: string | Date, time2: string | Date): boolean => {
    const date1 = new Date(time1)
    const date2 = new Date(time2)
    return date1 > date2
}
