import {
  Footer,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterLink,
  FooterLinkGroup,
} from "flowbite-react";

export default function AppFooter() {
  return (
    <Footer container className="rounded-none bg-neutral-900 border-t border-neutral-800 text-neutral-400">
      <div className="w-full text-center max-w-7xl mx-auto px-4 py-6">
        <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
          <FooterBrand
            href="https://flowbite.com"
            src="https://flowbite.com/docs/images/logo.svg"
            alt="Flowbite Logo"
            name="Flowbite"
          />
          <FooterLinkGroup className="mt-4 flex flex-wrap gap-4 sm:mt-0 sm:justify-center">
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Licensing</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
          </FooterLinkGroup>
        </div>
        <FooterDivider className="my-6 border-neutral-800" />
        <FooterCopyright href="#" by="Flowbite™" year={2026} className="text-neutral-500" />
      </div>
    </Footer>
  );
}
