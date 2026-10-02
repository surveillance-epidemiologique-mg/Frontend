import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar } from './component';

const meta = {
  title: 'Components/avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { name: 'Rakoto Andry', size: 'md' } };
