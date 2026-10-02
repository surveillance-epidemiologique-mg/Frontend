import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ZoneInfoPanel } from './component';

const meta = {
  title: 'Components/zone-info-panel',
  component: ZoneInfoPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof ZoneInfoPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
