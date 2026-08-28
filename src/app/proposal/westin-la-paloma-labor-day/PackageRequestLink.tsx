'use client'

type PackageRequestLinkProps = {
  packageId: string
}

export default function PackageRequestLink({ packageId }: PackageRequestLinkProps) {
  function requestPackage() {
    window.dispatchEvent(new CustomEvent('westin-package-selected', { detail: { packageId } }))
    document.getElementById('request-package')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button type="button" className="select-link" onClick={requestPackage}>
      Request this package
    </button>
  )
}
