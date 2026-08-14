import { classNames } from '../helpers/classNames'

describe('classNames', () => {
  it('should join string arguments with a space', () => {
    expect(classNames('tab', 'custom')).toBe('tab custom')
  })

  it('should ignore null, undefined and empty strings', () => {
    expect(classNames('tab', null, undefined, '')).toBe('tab')
  })

  it('should include object keys whose value is truthy', () => {
    expect(
      classNames('tab', {
        'tab--active': true,
        'tab--disabled': false,
        'tab--hidden': undefined,
      })
    ).toBe('tab tab--active')
  })

  it('should return an empty string when nothing applies', () => {
    expect(classNames(undefined, { 'tab--active': false })).toBe('')
  })
})
