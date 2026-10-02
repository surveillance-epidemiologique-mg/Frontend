import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ActionMenu } from './component';

const meta = {
  title: 'Components/action-menu',
  component: ActionMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
