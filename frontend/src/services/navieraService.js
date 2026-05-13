import apiClient from './apiClient'

export async function listarNavieras() {
  const { data } = await apiClient.get('/navieras')
  return data
}
