/**
 *  Function tinh toan gia tri skip cho phan trang
 * Giai thich cong thuc:
 * Vi du moi page co 12 items
 * Case 01: User dung tai trang 1, thi se lay 1 - 1 = 0, luc do skip = 0, nghia la khong skip ban ghi
 * Case 02: User dung tai trang 2, thi se lay 2 - 1 = 1, luc do skip = 1 * 12 = 12, nghia la skip 12 ban ghi cua 1 page truoc do
 * Case 03: User dung tai trang 5, thi se lay 5 - 1 = 4, luc do skip = 4 * 12 = 48, nghia la skip 48 ban ghi cua 4 page truoc do
 */
export const pagingSkipValue = (page, itemsPerPage) => {
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  return (page - 1) * itemsPerPage
}

