import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CentresTab } from './component';

const meta = {
  title: 'Components/centres-tab',
  component: CentresTab,
  tags: ['autodocs'],
} satisfies Meta<typeof CentresTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
