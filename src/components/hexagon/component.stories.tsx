import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Hexagon from './component';

const meta = {
  title: 'Components/hexagon',
  component: Hexagon,
  tags: ['autodocs'],
} satisfies Meta<typeof Hexagon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
