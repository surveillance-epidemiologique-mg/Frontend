import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MaladiesTab } from './MaladiesTab';

const meta = {
  title: 'Components/maladies-tab',
  component: MaladiesTab,
  tags: ['autodocs'],
} satisfies Meta<typeof MaladiesTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

