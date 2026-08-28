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

  function continueToConfirm() {
    document.getElementById('request-package')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          <p>{packageLabel} is selected. Continue reviewing, then confirm your direction at the bottom.</p>
          <button type="button" onClick={continueToConfirm}>Continue to Confirm</button>
        </div>
      )}
    </div>
  )
}
