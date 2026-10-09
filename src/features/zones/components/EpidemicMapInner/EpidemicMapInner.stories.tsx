import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EpidemicMapInner } from './EpidemicMapInner';

const meta = {
  title: 'Components/epidemic-map-inner',
  component: EpidemicMapInner,
  tags: ['autodocs'],
} satisfies Meta<typeof EpidemicMapInner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { canViewCaseLayers: true } };

