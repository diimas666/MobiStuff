import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius } from '../../constants/theme';
import {
  formatDeliveryAddressLine,
  type DeliveryAddress,
} from '../../types/deliveryAddress';

type Props = {
  addresses: DeliveryAddress[];
  selectedId: string | null;
  onSelect: (address: DeliveryAddress) => void;
  onClear: () => void;
};

export function CheckoutAddressPicker({
  addresses,
  selectedId,
  onSelect,
  onClear,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedAddress = addresses.find(item => item.id === selectedId) ?? null;

  if (addresses.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.wrap}>
        <Text style={styles.label}>Збережена адреса</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsOpen(true)}
          style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
          <View style={styles.triggerIcon}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.triggerContent}>
            <Text style={styles.triggerTitle} numberOfLines={1}>
              {selectedAddress ? selectedAddress.label : 'Оберіть адресу доставки'}
            </Text>
            <Text style={styles.triggerSubtitle} numberOfLines={2}>
              {selectedAddress
                ? formatDeliveryAddressLine(selectedAddress)
                : `${addresses.length} збережених адрес`}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.sheet} onPress={event => event.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Адреси доставки</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.options}>
              {addresses.map(address => {
                const isSelected = address.id === selectedId;

                return (
                  <Pressable
                    key={address.id}
                    accessibilityRole="button"
                    onPress={() => {
                      onSelect(address);
                      setIsOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{address.label}</Text>
                      <Text style={styles.optionSubtitle}>
                        {formatDeliveryAddressLine(address)}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    ) : (
                      <View style={styles.optionRadio} />
                    )}
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onClear();
                  setIsOpen(false);
                }}
                style={({ pressed }) => [styles.manualOption, pressed && styles.pressed]}>
                <Ionicons name="create-outline" size={18} color={colors.textMuted} />
                <Text style={styles.manualOptionText}>Ввести нову адресу вручну</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  triggerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(45, 184, 75, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerContent: {
    flex: 1,
    gap: 2,
  },
  triggerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  triggerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.screen,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.screen,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.primary,
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  optionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  manualOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  manualOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
