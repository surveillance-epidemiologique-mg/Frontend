import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MapActions } from './MapActions';

const meta = {
  title: 'Components/map-actions',
  component: MapActions,
  tags: ['autodocs'],
} satisfies Meta<typeof MapActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

