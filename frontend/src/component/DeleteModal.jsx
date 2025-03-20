import { Button, Modal } from "flowbite-react";
import React from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function DeleteModal({ deleteModal, setDeleteModal, handleDelete }) {
  return (
    <Modal
      show={deleteModal}
      onClose={() => {
        setDeleteModal(false);
      }}
      size="md"
      popup
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
          <h3 className="text-lg mb-5 text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this comment?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={() => handleDelete()}>
              Yes, I'm sure
            </Button>
            <Button
              color="gray"
              onClick={() => {
                setDeleteModal(false);
              }}
            >
              No, cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
