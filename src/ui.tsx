import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

export const colors = {
  ink: '#1C1C1E',
  muted: '#636366',
  faint: '#8E8E93',
  paper: '#F2F2F7',
  surface: '#FFFFFF',
  line: '#D1D1D6',
  navy: '#007AFF',
  teal: '#30B0C7',
  mint: '#EAF8F1',
  gold: '#FF9500',
  rose: '#FF3B30',
  coral: '#FF9500',
  blue: '#007AFF',
  lavender: '#AF52DE',
  green: '#34C759',
  grouped: '#F2F2F7',
  secondary: '#F9F9FB',
};

export const typeColor = {
  teacher: colors.blue,
  parent: colors.green,
  student: colors.gold,
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Icon({
  name,
  size = 18,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function Card({
  children,
  style,
  tone = 'plain',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'plain' | 'mint' | 'blue' | 'gold' | 'rose';
}) {
  return <View style={[styles.card, toneStyles[tone], style]}>{children}</View>;
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionTitle}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionText}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function Pill({
  children,
  color = colors.navy,
  icon,
}: {
  children: React.ReactNode;
  color?: string;
  icon?: IconName;
}) {
  return (
    <View style={[styles.pill, { borderColor: `${color}30`, backgroundColor: `${color}12` }]}>
      {icon ? <Icon name={icon} size={13} color={color} /> : null}
      <Text style={[styles.pillText, { color }]}>{children}</Text>
    </View>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  active,
  color = colors.navy,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  active?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        active && { backgroundColor: color, borderColor: color },
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={18} color={active ? colors.surface : color} />
      <Text style={[styles.iconButtonText, active && { color: colors.surface }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string; icon: IconName; color?: string }>;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        const color = option.color ?? colors.navy;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentItem,
              active && { backgroundColor: color, borderColor: color },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={option.icon} color={active ? colors.surface : color} size={16} />
            <Text style={[styles.segmentText, active && { color: colors.surface }]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBar({
  value,
  target,
  color = colors.teal,
}: {
  value: number;
  target: number;
  color?: string;
}) {
  const percent = Math.min(100, Math.round((value / target) * 100));
  return (
    <View style={styles.progressOuter}>
      <View style={[styles.progressInner, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Metric({
  label,
  value,
  icon,
  color = colors.navy,
}: {
  label: string;
  value: string;
  icon: IconName;
  color?: string;
}) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}14` }]}>
        <Icon name={icon} size={17} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
} & Pick<TextInputProps, 'keyboardType'>) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMulti]}
      />
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  detail,
}: {
  icon: IconName;
  title: string;
  detail: string;
}) {
  return (
    <Card style={styles.empty}>
      <Icon name={icon} size={26} color={colors.faint} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
    </Card>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: '#E5E5EA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 10,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.04)',
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
  },
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  iconButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  segmented: {
    borderRadius: 8,
    backgroundColor: '#E9E9EE',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 38,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 6,
  },
  segmentText: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 12,
  },
  progressOuter: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    overflow: 'hidden',
  },
  progressInner: {
    height: '100%',
    borderRadius: 8,
  },
  metric: {
    flex: 1,
    minWidth: 96,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: colors.secondary,
    padding: 10,
    gap: 5,
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: colors.secondary,
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  inputMulti: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyDetail: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    fontSize: 13,
  },
});

const toneStyles = StyleSheet.create({
  plain: {},
  mint: {
    backgroundColor: '#F7FFF9',
    borderColor: '#CDEDD8',
  },
  blue: {
    backgroundColor: '#F7FAFF',
    borderColor: '#D6E8FF',
  },
  gold: {
    backgroundColor: '#FFF9EF',
    borderColor: '#FFE0A3',
  },
  rose: {
    backgroundColor: '#FFF6F6',
    borderColor: '#FFD1D1',
  },
});
