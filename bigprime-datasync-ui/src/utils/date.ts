import dayjs from 'dayjs'
import moment from 'moment'

export const addTimeToDate = (date: Date, hours: number, minutes: number, seconds: number) => {
    const millisecondsToAdd = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
    return dayjs(date).add(millisecondsToAdd)
}

export const getNowDateTime = () => {
    return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export const getNowDate = () => {
    return dayjs().format('YYYY-MM-DD')
}

export const formatDateTime = (date: any) => {
    if (!date) {
        return ''
    }
    
    // 处理字符串格式 "yyyy-MM-dd HH:mm:ss"
    if (typeof date === 'string') {
        // 将 "yyyy-MM-dd HH:mm:ss" 格式转换为 dayjs 可以解析的格式
        const parsedDate = dayjs(date.replace(/-/g, '/'), 'YYYY/MM/DD HH:mm:ss')
        if (parsedDate.isValid()) {
            return parsedDate.format('YYYY-MM-DD HH:mm:ss')
        }
    }
    
    // 处理数组格式 [year, month, day, hour, minute, second]
    if (Array.isArray(date) && date.length >= 6) {
        const [year, month, day, hour, minute, second] = date
        const parsedDate = dayjs(new Date(year, month - 1, day, hour, minute, second))
        if (parsedDate.isValid()) {
            return parsedDate.format('YYYY-MM-DD HH:mm:ss')
        }
    }
    
    // 其他格式直接使用 dayjs 解析
    const parsedDate = dayjs(date)
    if (parsedDate.isValid()) {
        return parsedDate.format('YYYY-MM-DD HH:mm:ss')
    }
    
    return ''
}

export const formatDate = (date: any) => {
    if (date) {
        return dayjs(date).format('YYYY-MM-DD')
    }
    return ''
}


export const getDateYear = (date: Date) => {
    return dayjs(date).year()
}

export const getDayAndHours = (date: string) => {
    const momentObj = moment(date)
    const now = moment()
    const duration = moment.duration(now.diff(momentObj))
    if (duration.asDays() < 1) {
        if (duration.hours() < 1) {
            return duration.minutes() + 'm'
        } else {
            return duration.hours() + 'h'
        }
    } else {
        return Math.floor(duration.asDays()) + 'd '
    }
}