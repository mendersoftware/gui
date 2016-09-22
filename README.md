#
[![Build Status](https://travis-ci.com/mendersoftware/gui.svg?token=rx8YqsZ2ZyaopcMPmDmo&branch=master)](https://travis-ci.com/mendersoftware/gui)

Graphical user interface for Mender, a software updater for connected devices. 
Visit [mender.io](https://mender.io) to learn more about Mender, or 
[docs.mender.io](https://docs.mender.io) to read our documentation and learn 
how to get started.

Built using [React](https://facebook.github.io/react/) and 
[materials-ui](material-ui.com/#/). 

---

### Known issues
The UI is under development, so there are several known issues:

22-09-2016:
- Not implemented an interval check on deployments, device admissions or 
dashboard - so user must refresh pages
- Not all inventory attributes are shown in the expanded details
- Breaking bug when creating deployment via the image details dropdown
- Long strings such as image_id are sometimes cut off, would like to be able 
to see whole string
- Deployment icon in image details dropdown should match the one in device 
details
- Software table sorting icon not changing direction
- Device tables not sorting
- Fonts are not vendored, so rely on user being online to display properly
- Pagination/lazy loading for devices not implemented so there is a high max 
per page set for GET calls
- The notifications on snackbars don't stack/queue if there are more than one 
at a time
- Not opening proper report type for clicking through an "in progress" report 
in dashboard 
- Device list in reports is not sortable
- "Show log" button shows even if log doesn't exist or has content
- Error log has no line endings when shown in dialog