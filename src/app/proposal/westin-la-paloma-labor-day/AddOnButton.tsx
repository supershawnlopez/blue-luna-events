'use client'

import { useEffect, useState } from 'react'
import { westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

type AddOnButtonProps = {
  addOnId: string
}

type WestinWindow = Window & {
  __westinSelectedPackageId?: string
  __westinAddedAddOnIds?: string[]
}

export default function AddOnButton({ addOnId }: AddOnButtonProps) {
  const [selectedPackageId, setSelectedPackageId] = useState(() =>
    typeof window === 'undefined' ? 'package-a' : ((window as WestinWindow).__westinSelectedPackageId ?? 'package-a')
  )
  const [addedIds, setAddedIds] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : ((window as WestinWindow).__westinAddedAddOnIds ?? [])
  )
  const addOn = westinProposal.addOns.find(item => item.id === addOnId)

  useEffect(() => {
    function handlePackageState(event: Event) {
      const packageId = (event as CustomEvent<{ packageId?: string }>).detail?.packageId
      if (packageId) {
        const westinWindow = window as WestinWindow
        westinWindow.__westinSelectedPackageId = packageId
        setSelectedPackageId(packageId)
      }
    }

    function handleAddOnState(event: Event) {
      const ids = (event as CustomEvent<{ addedIds?: string[] }>).detail?.addedIds
      if (Array.isArray(ids)) setAddedIds(ids)
    }

    window.addEventListener('westin-package-selected', handlePackageState)
    window.addEventListener('westin-package-state-changed', handlePackageState)
    window.addEventListener('westin-addon-state-changed', handleAddOnState)
    return () => {
      window.removeEventListener('westin-package-selected', handlePackageState)
      window.removeEventListener('westin-package-state-changed', handlePackageState)
      window.removeEventListener('westin-addon-state-changed', handleAddOnState)
    }
  }, [])

  if (!addOn) return null

  const included = addOn.includedIn.includes(selectedPackageId)
  const added = addedIds.includes(addOn.id)

  function toggleAddOn() {
    if (included) return
    window.dispatchEvent(new CustomEvent('westin-addon-toggle', { detail: { addOnId } }))
  }

  if (included) {
    return <span className="addon-chip included">Included in selected direction</span>
  }

  return (
    <button type="button" className={added ? 'addon-chip added' : 'addon-chip'} onClick={toggleAddOn}>
      {added ? 'Added to direction' : 'Add to selected direction'}
    </button>
  )
}
