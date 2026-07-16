import type { Meta, StoryObj } from '@storybook/react-vite';
import ScrollableList from './ScrollableList';

const meta = {
  title: 'Shared/ScrollableList',
  component: ScrollableList,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    children: null,
  },
} satisfies Meta<typeof ScrollableList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <div className="p-3 bg-white border border-neutral-200 rounded-md">Item 1</div>
        <div className="p-3 bg-white border border-neutral-200 rounded-md">Item 2</div>
        <div className="p-3 bg-white border border-neutral-200 rounded-md">Item 3</div>
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: null,
  },
};

export const LoadingWithMessage: Story = {
  args: {
    loading: true,
    loadingMessage: 'Fetching groups...',
    children: null,
  },
};

export const Empty: Story = {
  args: {
    children: null,
    emptyState: (
      <div className="py-8 text-center text-neutral-500">
        <p className="text-sm">No items found</p>
      </div>
    ),
  },
};

export const WithMaxHeight: Story = {
  args: {
    maxHeight: '300px',
    fillAvailable: false,
    children: (
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="p-3 bg-white border border-neutral-200 rounded-md">
            Item {i + 1}
          </div>
        ))}
      </>
    ),
  },
};

export const FillAvailable: Story = {
  args: {
    fillAvailable: true,
    children: (
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="p-3 bg-white border border-neutral-200 rounded-md">
            Item {i + 1}
          </div>
        ))}
      </>
    ),
  },
};
