'use client'

import { useEffect, useState } from 'react'

type PackageRequestLinkProps = {
  packageId: string
  packageLabel: string
}

export default function PackageRequestLink({ packageId, packageLabel }: PackageRequestLinkProps) {
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const selected = selectedPackageId === packageId

  function requestPackage() {
    window.dispatchEvent(new CustomEvent('westin-package-selected', { detail: { packageId } }))
  }

  useEffect(() => {
    function handlePackageSelected(event: Event) {
      setSelectedPackageId((event as CustomEvent<{ packageId?: string }>).detail?.packageId ?? '')
    }

    window.addEventListener('westin-package-selected', handlePackageSelected)
    return () => window.removeEventListener('westin-package-selected', handlePackageSelected)
  }, [])

  return (
    <div className="package-action">
      <button type="button" className={selected ? 'select-link selected' : 'select-link'} onClick={requestPackage}>
        {selected ? 'Package selected' : 'Request this package'}
      </button>
      {selected && (
        <div className="package-selected-note">
          <p>{packageLabel} is selected. Continue through the proposal, review the design/weather notes, and confirm your direction when you reach the bottom.</p>
        </div>
      )}
    </div>
  )
}
