import { reindex } from "./indexer"


describe("reindex(md)", () => {

  describe("re-index references", () => {

    test("re-order by position", () => {
      const inp = '[^2] [^1]\n[^1]: ref 1\n[^2]: ref 2'
      const exp = '[^1] [^2]\n[^1]: ref 2\n[^2]: ref 1'
      expect(reindex(inp)).toEqual(exp)
    })

    test("hole between order", () => {
      const inp = '[^1] [^7]'
      const exp = '[^1] [^2]\n[^1]: \n[^2]: '
      expect(reindex(inp)).toEqual(exp)
    })
  })

  describe("re-order reference definations", () => {

    test("re-order by position", () => {
      const inp = '[^1] [^2]\n[^2]: ref 1\n[^1]: ref 2'
      const exp = '[^1] [^2]\n[^1]: ref 2\n[^2]: ref 1'
      expect(reindex(inp)).toEqual(exp)
    })

    test("hole between order", () => {
      const inp = '[^1]: ref 1\n[^7]: ref 7'
      const exp = '\n[^1]: ref 1\n[^2]: ref 7'
      expect(reindex(inp)).toEqual(exp)
    })
  })

  test("duplicate references", () => {
    const inp = '[^2] [^1] [^2]'
    const exp = '[^1] [^2] [^1]\n[^1]: \n[^2]: '
    expect(reindex(inp)).toEqual(exp)
  })

  test("reference more than definations", () => {
    const inp = '[^1] [^2]\n[^1]: ref 2'
    const exp = '[^1] [^2]\n[^1]: ref 2\n[^2]: '
    expect(reindex(inp)).toEqual(exp)
  })

  test("reference less than definations", () => {
    const inp = '[^1]\n[^1]: ref 2\n[^2]: '
    expect(reindex(inp)).toEqual(inp)
  })
})
