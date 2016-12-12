[![Build Status](https://travis-ci.org/mendersoftware/gui.svg?branch=master)](https://travis-ci.org/mendersoftware/gui)
[![Docker pulls](https://img.shields.io/docker/pulls/mendersoftware/gui.svg?maxAge=3600)](https://hub.docker.com/r/mendersoftware/deployments/)


Mender: GUI
==============================================

Mender is an open source over-the-air (OTA) software updater for embedded Linux
devices. Mender comprises a client running at the embedded device, as well as
a server that manages deployments across many devices.

This repository contains the Mender Graphical User Interface, which is part of the
Mender server. The Mender server is designed as a microservices architecture
and comprises several repositories.

The GUI exposes the entirety of Mender's functionality to the user, including
deployment definition, scheduling and monitoring, device listing and admission, etc.


![Mender logo](https://mender.io/user/pages/04.resources/_logos/logoS.png)


## Getting started

To start using Mender, we recommend that you begin with the Getting started
section in [the Mender documentation](https://docs.mender.io/).

## Contributing

We welcome and ask for your contribution. If you would like to contribute to Mender, please read our guide on how to best get started [contributing code or
documentation](https://github.com/mendersoftware/mender/blob/master/CONTRIBUTING.md).

## Development

In order to develop the GUI code to contribute, it is required to 
install [gulp](https://github.com/gulpjs/gulp) and all the dependencies in 
package.json. Work on the files in 'src'. Running 'gulp' will watch for your 
changes as you develop and build as you go. Always run 'gulp build' to build 
the production code in 'dist' before you commit.

## License

Mender is licensed under the Apache License, Version 2.0. See
[LICENSE](https://github.com/mendersoftware/gui/blob/master/LICENSE) for the
full license text.

## Security disclosure

We take security very seriously. If you come across any issue regarding
security, please disclose the information by sending an email to
[security@mender.io](security@mender.io). Please do not create a new public
issue. We thank you in advance for your cooperation.

## Connect with us

* Join our [Google
  group](https://groups.google.com/a/lists.mender.io/forum/#!forum/mender)
* Follow us on [Twitter](https://twitter.com/mender_io?target=_blank). Please
  feel free to tweet us questions.
* Fork us on [Github](https://github.com/mendersoftware)
* Email us at [contact@mender.io](mailto:contact@mender.io)
