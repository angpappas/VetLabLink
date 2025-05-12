export interface DataPage<Type> {
    data: Array<Type>;
    currentPage: number;
    pageSize: number;
    totalRecords: number;
}
