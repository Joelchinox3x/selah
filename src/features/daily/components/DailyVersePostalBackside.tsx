import React from 'react';
import { CommunityReflectionsModal } from './CommunityReflectionsModal';
export type { CommunityComment } from '../services/communityReflections';

interface DailyVersePostalBacksideProps {
  active?: boolean;
  verseSlug: string;
  verseCitation: string;
  verseText: string;
  pastoralReflection?: string;
  pastoralTitle?: string;
  pastoralTheme?: string;
  onFlipToFront: () => void;
  onClose: () => void;
  onGoToReader: () => void;
  onCommentCountChange?: (count: number) => void;
}

// Reuse the same wall inside the existing 3D postal rather than maintaining two designs.
export const DailyVersePostalBackside: React.FC<DailyVersePostalBacksideProps> = ({
  active = true, verseSlug, verseCitation, verseText, pastoralReflection, pastoralTitle, pastoralTheme, onFlipToFront, onClose, onGoToReader, onCommentCountChange,
}) => (
  <CommunityReflectionsModal
    embedded
    visible={active}
    verseSlug={verseSlug}
    verseCitation={verseCitation}
    verseText={verseText}
    pastoralReflection={pastoralReflection}
    pastoralTitle={pastoralTitle}
    pastoralTheme={pastoralTheme}
    onBack={onFlipToFront}
    onClose={onClose}
    onGoToReader={onGoToReader}
    onCommentCountChange={onCommentCountChange}
  />
);
