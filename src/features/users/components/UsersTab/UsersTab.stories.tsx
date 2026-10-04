import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { UsersTab } from './UsersTab';

const meta = {
  title: 'Components/users-tab',
  component: UsersTab,
  tags: ['autodocs'],
} satisfies Meta<typeof UsersTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

