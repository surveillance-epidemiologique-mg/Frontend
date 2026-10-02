import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tabs } from './component';

const meta = {
  title: 'Components/tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
