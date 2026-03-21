import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import SectionWrapper from "@/components/preview/SectionWrapper";
import type { CustomSectionProp } from "@/components/templates/PortfolioTemplateProps";
import { getCustomSectionAvailability as getSharedCustomSectionAvailability } from "./portfolioSectionAvailability";
import { createCustomSectionId } from "./portfolioSections";

type CustomSectionRenderer = (section: CustomSectionProp, index: number) => JSX.Element;

export const buildCustomSectionMap = (
  customSections: CustomSectionProp[] | undefined,
  renderer: CustomSectionRenderer
) =>
  Object.fromEntries(
    (customSections || []).map((section, index) => [createCustomSectionId(section.id), renderer(section, index)])
  );

export const hasCustomSections = (customSections: CustomSectionProp[] | undefined) =>
  Boolean(customSections && customSections.length > 0);

export const getCustomSectionAvailability = getSharedCustomSectionAvailability;

export const renderSimpleCustomSection = (
  section: CustomSectionProp,
  sectionId: string,
  editMode: boolean | undefined,
  onSectionEdit: ((section: string) => void) | undefined,
  contentClassName: string,
  titleClassName: string,
  bodyClassName: string,
  containerStyle?: CSSProperties
) => (
  <SectionWrapper key={sectionId} id={sectionId} editMode={editMode} onEdit={onSectionEdit}>
    <motion.section id={sectionId} className={contentClassName} style={containerStyle}>
      <h2 className={titleClassName}>{section.title || "Custom Section"}</h2>
      {section.body && <p className={bodyClassName}>{section.body}</p>}
    </motion.section>
  </SectionWrapper>
);
