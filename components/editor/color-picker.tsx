import { View, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const PALETTE_COLORS = [
  '#5C4A6E', '#F9A8C9', '#C9A8F9', '#F9E4A8',
  '#A8F9D8', '#8BB8F9', '#F28B82', '#FFFFFF',
  '#333333', '#E88AB3', '#9B7FD4', '#F9D060',
  '#5BC49C', '#5A9EF2', '#D95A5A', '#C4B0D0',
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        paddingVertical: 8,
      }}
    >
      {PALETTE_COLORS.map((color) => {
        const isSelected = selectedColor === color;
        const isWhite = color === '#FFFFFF';
        return (
          <Pressable
            key={color}
            onPress={() => onSelectColor(color)}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: color,
              borderWidth: isSelected ? 3 : isWhite ? 1.5 : 0,
              borderColor: isSelected ? '#5C4A6E' : isWhite ? '#E0D5EA' : 'transparent',
              boxShadow: isSelected ? '0 2px 8px rgba(92,74,110,0.25)' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.85 : isSelected ? 1.1 : 1 }],
            })}
          >
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={14}
                color={isWhite || color === '#F9E4A8' || color === '#A8F9D8' ? '#5C4A6E' : '#FFFFFF'}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
