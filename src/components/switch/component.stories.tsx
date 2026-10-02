import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Switch } from './component';

const meta = {
  title: 'Components/switch',
  component: Switch,
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
