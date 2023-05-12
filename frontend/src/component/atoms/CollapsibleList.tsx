import { SimpleLineIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { PRIMARY_COLOR } from '../../constants';

type Props<T> = {
  sections: Array<{
    id: string;
    title: string;
    data: Array<T>;
  }>;
  openSectionIds: Array<string>;
  setOpenSectionIds: (_: Array<string>) => void;
  renderItem: (item: T) => React.ReactElement;
  refreshing: SectionList['props']['refreshing'];
  onRefresh: SectionList['props']['onRefresh'];
};

export const CollapsibleList = <T extends { id: string }>({
  sections,
  openSectionIds,
  setOpenSectionIds,
  renderItem,
  refreshing,
  onRefresh,
}: Props<T>) => {
  const tw = useTailwind();

  const toggleSection = (sectionId: string) => {
    const open = openSectionIds.includes(sectionId);
    if (open) {
      setOpenSectionIds(openSectionIds.filter((id) => id !== sectionId));
    } else {
      setOpenSectionIds([...openSectionIds, sectionId]);
    }
  };

  useEffect(() => {
    console.log(JSON.stringify(openSectionIds));
  }, [openSectionIds]);

  return (
    <SectionList
      sections={sections}
      extraData={openSectionIds}
      keyExtractor={(item) => item.id}
      renderItem={({ item, section: { id, data }, index }) =>
        openSectionIds.includes(id) ? (
          <View
            style={[
              tw('bg-white mx-3 p-4'),
              index === 0 && tw('rounded-t-lg'),
              index === data.length - 1 && tw('rounded-b-lg'),
            ]}
          >
            {renderItem(item)}
          </View>
        ) : (
          <></>
        )
      }
      renderSectionHeader={({ section: { id, title } }) => (
        <Pressable onPress={() => toggleSection(id)}>
          <View style={tw('flex-row justify-between items-center mx-3 p-3')}>
            <Text style={tw('text-xl font-bold')}>{title}</Text>
            <SimpleLineIcons
              name={openSectionIds.includes(id) ? 'arrow-down' : 'arrow-right'}
              size={12}
              color={PRIMARY_COLOR}
            />
          </View>
        </Pressable>
      )}
      ItemSeparatorComponent={() => (
        <View style={tw('bg-gray-100 h-px mx-3')} />
      )}
      refreshing={refreshing}
      onRefresh={onRefresh}
      stickySectionHeadersEnabled={false}
    />
  );
};
