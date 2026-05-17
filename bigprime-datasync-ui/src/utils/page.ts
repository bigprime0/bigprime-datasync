export namespace PageUtils {
    export const setTableHeight = (minusHeight: any) => {
        if (!minusHeight) minusHeight = 275
        const windowHeight = window.innerHeight
        return windowHeight - minusHeight
    }
}
