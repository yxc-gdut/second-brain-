import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteCard from '@/components/NoteCard.vue'

function createNote(overrides = {}) {
  return {
    id: 'note-1',
    content: '这是一条测试笔记的内容，用于验证 NoteCard 组件的渲染。',
    category: 'work' as const,
    createdAt: new Date().toISOString(),
    tags: ['产品', '技术'],
    source: '小红书',
    ...overrides,
  }
}

describe('NoteCard', () => {
  it('renders note content', () => {
    const note = createNote()
    const wrapper = mount(NoteCard, {
      props: { note },
    })
    expect(wrapper.text()).toContain('这是一条测试笔记的内容')
  })

  it('displays work category emoji', () => {
    const wrapper = mount(NoteCard, {
      props: { note: createNote({ category: 'work' }) },
    })
    expect(wrapper.text()).toContain('💼')
  })

  it('displays personal category emoji', () => {
    const wrapper = mount(NoteCard, {
      props: { note: createNote({ category: 'personal' }) },
    })
    expect(wrapper.text()).toContain('🏠')
  })

  it('displays source when provided', () => {
    const wrapper = mount(NoteCard, {
      props: { note: createNote({ source: '小红书' }) },
    })
    expect(wrapper.text()).toContain('小红书')
  })

  it('displays tags', () => {
    const wrapper = mount(NoteCard, {
      props: { note: createNote({ tags: ['产品', '技术'] }) },
    })
    expect(wrapper.text()).toContain('产品')
    expect(wrapper.text()).toContain('技术')
  })

  it('shows "+N" for more than 2 tags', () => {
    const wrapper = mount(NoteCard, {
      props: {
        note: createNote({ tags: ['产品', '技术', '设计', '运营'] }),
      },
    })
    expect(wrapper.text()).toContain('+2')
  })

  it('truncates long content', () => {
    const longContent = 'A'.repeat(200)
    const wrapper = mount(NoteCard, {
      props: { note: createNote({ content: longContent }) },
    })
    expect(wrapper.text()).toContain('...')
  })

  it('does not truncate short content', () => {
    const shortContent = '短内容'
    const wrapper = mount(NoteCard, {
      props: { note: createNote({ content: shortContent }) },
    })
    expect(wrapper.text()).toContain('短内容')
    expect(wrapper.text()).not.toContain('...')
  })

  it('emits click event with note id', async () => {
    const wrapper = mount(NoteCard, {
      props: { note: createNote({ id: 'my-note-id' }) },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')![0]).toEqual(['my-note-id'])
  })

  it('renders without tags and source', () => {
    const wrapper = mount(NoteCard, {
      props: {
        note: createNote({ tags: undefined, source: undefined }),
      },
    })
    expect(wrapper.find('.card-footer').exists()).toBe(false)
  })

  it('renders date', () => {
    const wrapper = mount(NoteCard, {
      props: { note: createNote() },
    })
    // Should have a date element
    expect(wrapper.find('.date').exists()).toBe(true)
  })
})
