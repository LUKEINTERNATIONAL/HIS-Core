import { optionsActionSheet } from '@/utils/ActionSheets'

export default async function popVoidReason(callback: Function, size = 'action-sheet-modal') {
    const modal = await optionsActionSheet(
        'Are you sure you want to void?',
        'Please specify reason for voiding this encounter',
        [
          'Mistake/ Wrong Entry',
          'Duplicate',
          'System Error' 
        ],
        [
            { name: 'Cancel', slot:'start'},
            { name: 'Void', color: 'danger', slot:'end', role: 'action'}
        ],
        '',
        size
    )
    if (modal.selection && modal.action === 'Void') {
        await callback(modal.selection)
    }
}
