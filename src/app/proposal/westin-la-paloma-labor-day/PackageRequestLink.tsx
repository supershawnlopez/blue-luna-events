'use client'

import { useEffect, useState } from 'react'

type PackageRequestLinkProps = {
  packageId: string
  packageLabel: string
}

type WestinWindow = Window & {
  __westinSelectedPackageId?: string
}

export default function PackageRequestLink({ packageId, packageLabel }: PackageRequestLinkProps) {
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const selected = selectedPackageId === packageId

  function requestPackage() {
    const westinWindow = window as WestinWindow
    westinWindow.__westinSelectedPackageId = packageId
    window.dispatchEvent(new CustomEvent('westin-package-selected', { detail: { packageId } }))
  }

  useEffect(() => {
    function handlePackageSelected(event: Event) {
      setSelectedPackageId((event as CustomEvent<{ packageId?: string }>).detail?.packageId ?? '')
    }

    window.addEventListener('westin-package-selected', handlePackageSelected)
    window.addEventListener('westin-package-state-changed', handlePackageSelected)
    return () => {
      window.removeEventListener('westin-package-selected', handlePackageSelected)
      window.removeEventListener('westin-package-state-changed', handlePackageSelected)
    }
  }, [])

  return (
    <div className="package-action">
      <button type="button" className={selected ? 'select-link selected' : 'select-link'} onClick={requestPackage}>
        {selected ? 'Package selected' : 'Request this package'}
      </button>
      {selected && (
        <div className="package-selected-note">
          <p>{packageLabel} is picked. Keep going through the proposal, then Monica can review any changes you make at the bottom.</p>
        </div>
      )}
    </div>
  )
}
