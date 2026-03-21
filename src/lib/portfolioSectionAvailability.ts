import type { ContactProp, CustomSectionProp, PortfolioData } from "@/components/templates/PortfolioTemplateProps";
import { createCustomSectionId } from "@/lib/portfolioSections";

type PortfolioSectionAvailabilityInput = Pick<
  PortfolioData,
  "bio" | "projects" | "skills" | "experiences" | "education" | "contact" | "certifications" | "customSections"
>;

const hasValue = (value?: string | null) => Boolean(value?.trim());

export const hasContactContent = (contact: ContactProp | null | undefined) => Boolean(
  contact && (
    hasValue(contact.email) ||
    hasValue(contact.phone) ||
    hasValue(contact.github_url) ||
    hasValue(contact.linkedin_url) ||
    hasValue(contact.twitter_url) ||
    hasValue(contact.website_url)
  )
);

export const getCustomSectionAvailability = (customSections: CustomSectionProp[] | undefined) =>
  Object.fromEntries(
    (customSections || []).map((section) => [
      createCustomSectionId(section.id),
      hasValue(section.title) || hasValue(section.body),
    ])
  );

export const getPortfolioSectionAvailability = ({
  bio,
  projects,
  skills,
  experiences,
  education,
  contact,
  certifications,
  customSections,
}: PortfolioSectionAvailabilityInput) => ({
  bio: Boolean(
    hasValue(bio?.first_name) ||
    hasValue(bio?.last_name) ||
    hasValue(bio?.headline) ||
    hasValue(bio?.bio) ||
    hasValue(bio?.avatar_url) ||
    hasValue(bio?.location)
  ),
  projects: projects.length > 0,
  skills: skills.length > 0,
  experience: experiences.length > 0,
  education: education.length > 0,
  certifications: certifications.length > 0,
  contact: hasContactContent(contact),
  ...getCustomSectionAvailability(customSections),
});
