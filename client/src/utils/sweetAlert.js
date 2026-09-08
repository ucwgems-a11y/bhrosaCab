import Swal from "sweetalert2";

export const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger"
  },
  buttonsStyling: false
});

/**
 * Center Auto-closing Success Alert (Speed 1000ms)
 * @param {string} [title="Your work has been saved"]
 * @param {number} [timer=1000]
 */
export function showSuccessAlert(title = "Your work has been saved", timer = 1000) {
  return Swal.fire({
    position: "center",
    icon: "success",
    title,
    showConfirmButton: false,
    timer,
  });
}

/**
 * Center Error Alert
 * @param {string} [title="An error occurred"]
 */
export function showErrorAlert(title = "An error occurred") {
  return Swal.fire({
    position: "center",
    icon: "error",
    title,
    showConfirmButton: true,
  });
}

/**
 * Standard SweetAlert Delete Confirmation
 * @param {Object} options
 * @param {string} [options.title="Are you sure?"]
 * @param {string} [options.text="You won't be able to revert this!"]
 * @param {string} [options.confirmButtonText="Yes, delete it!"]
 * @param {string} [options.cancelButtonText="No, cancel!"]
 * @param {string} [options.deletedTitle="Deleted!"]
 * @param {string} [options.deletedText="Your item has been deleted."]
 * @param {string} [options.cancelledTitle="Cancelled"]
 * @param {string} [options.cancelledText="Your item is safe :)"]
 * @param {Function} [options.onConfirm]
 * @param {Function} [options.onCancel]
 */
export function confirmDelete({
  title = "Are you sure?",
  text = "You won't be able to revert this!",
  confirmButtonText = "Yes, delete it!",
  cancelButtonText = "No, cancel!",
  deletedTitle = "Deleted!",
  deletedText = "Your item has been deleted.",
  cancelledTitle = "Cancelled",
  cancelledText = "Your item is safe :)",
  showSuccessAlert: shouldShowSuccess = true,
  onConfirm = () => {},
  onCancel = () => {},
} = {}) {
  return swalWithBootstrapButtons
    .fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        onConfirm();
        if (shouldShowSuccess) {
          showSuccessAlert(deletedText || "Deleted successfully", 1000);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        onCancel();
        swalWithBootstrapButtons.fire({
          title: cancelledTitle,
          text: cancelledText,
          icon: "error",
        });
      }
    });
}

export default Swal;
