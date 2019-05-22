import { defaultLoadItemsODataOptions, loadItems } from '../src/ListPicker/loaders'
import { mockContent } from './mocks/items'

const repository = {
  loadCollection: jest.fn(() => {
    return {
      d: {
        results: [
          {
            ParentId: 123,
          },
        ],
      },
    }
  }),
  load: jest.fn(() => {
    return { d: {} }
  }),
} as any

const mockOdataOptions = {
  select: ['DisplayName'],
  filter: "isOf('Image')",
  metadata: 'no',
  orderby: 'DisplayName',
}

describe('loadItems function', () => {
  it('should load with default OData options', async () => {
    await loadItems({ repository, path: '' })
    expect(repository.loadCollection).toBeCalledWith({ oDataOptions: defaultLoadItemsODataOptions, path: '' })
  })

  it('should load with provided OData options', async () => {
    await loadItems({ repository, path: '', itemsODataOptions: mockOdataOptions } as any)
    expect(repository.loadCollection).toBeCalledWith({ oDataOptions: mockOdataOptions, path: '' })
  })

  it('should load with parent', async () => {
    repository.load = jest.fn(() => {
      return { d: mockContent }
    })
    const items = await loadItems({ repository, path: '' })
    expect(repository.load).toBeCalled()
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveProperty('isParent', true)
  })
})
