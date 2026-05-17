import request from '@/utils/request'

/**
 * 根据表名查询血缘
 */
export function queryLineageByTableName(tableName, upDepth = 1, downDepth = 1) {
  return request({
    url: `/api/lineage/query/table/${tableName}`,
    method: 'get',
    params: {
      upDepth,
      downDepth
    }
  })
}

/**
 * 根据字段名查询血缘
 */
export function queryLineageByColumnName(columnName, upDepth = 1, downDepth = 1) {
  return request({
    url: `/api/lineage/query/column/${columnName}`,
    method: 'get',
    params: {
      upDepth,
      downDepth
    }
  })
}

/**
 * 查询上游血缘
 */
export function queryUpstream(data) {
  return request({
    url: '/api/lineage/query/upstream',
    method: 'post',
    data
  })
}

/**
 * 查询下游血缘
 */
export function queryDownstream(data) {
  return request({
    url: '/api/lineage/query/downstream',
    method: 'post',
    data
  })
}

/**
 * 查询完整血缘
 */
export function queryFullLineage(data) {
  return request({
    url: '/api/lineage/query/full',
    method: 'post',
    data
  })
}
