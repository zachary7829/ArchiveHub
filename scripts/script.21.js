/*
 * API
 */
var fetchHeaders = {
	'X-Requested-With': 'XMLHttpRequest',
	'X-CSRFToken': getCookie('csrftoken')
};

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function removeUrlParameter(url, key) {
    var rtn = url.split("?")[0],
        param,
        params_arr = [],
        queryString = (url.indexOf("?") !== -1) ? url.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
    	if (params_arr.length > 0) { 
        	rtn = rtn + "?" + params_arr.join("&");
        }
    }
    return rtn;
}

/*
 * Shortcut creation page
 */

$('.shortcut-form').find('form').submit(function(e) {
    var action = $('button[type=submit][clicked=true]').data('action');
    $(this).closest('form').attr('action', action);
})

$('.shortcut-form').find('form').find('button[type=submit]').click(function() {
    $('button[type=submit]', $(this).parents('form')).removeAttr('clicked');
    $(this).attr('clicked', 'true');
});

/*
 * RoutinePub page
 */

var clipboard = new ClipboardJS('.clipboard');

clipboard.on('success', function(e) {
    console.log(e.trigger.textContent);
    e.trigger.textContent = 'Copied!'
    setTimeout(function(){ 
        e.trigger.textContent = 'Copy'
    }, 2500);

});

/*
 * Subscribe buttons
 */

$('button[name=follow]').click(function() {
    var button = $(this);
    fetch('/follow/'+ button.closest('.follow-button').data('user-id'),{
        method: 'POST',
        headers: fetchHeaders,
        credentials: 'same-origin',
    }).then(function(response) {
        var data = response.json();
        if (response.ok) {
            data.then(function(result) {           
                button.toggleClass('hide');
                $('button[name=unfollow]').toggleClass('hide');
            })
        } else {
            data.then(function(result) {
                console.log('ERROR: ', result);
            });
        }
    });
})

$('button[name=unfollow]').click(function() {
    var button = $(this);
    fetch('/unfollow/'+ button.closest('.follow-button').data('user-id'),{
        method: 'POST',
        headers: fetchHeaders,
        credentials: 'same-origin',
    }).then(function(response) {
        var data = response.json();
        if (response.ok) {
            button.toggleClass('hide');
            $('button[name=follow]').toggleClass('hide');
        } else {
            data.then(function(result) {
                console.log('ERROR: ', result);
            });
        }
    });
})

/*
 * Notification
 */

 $('.notifications').find('button.read-all').click(function() {
    var button = $(this);
    fetch('/mark-all-as-read/',{
        method: 'POST',
        headers: fetchHeaders,
        credentials: 'same-origin',
    }).then(function(response) {
        var data = response.json();
        if (response.ok) {
            data.then(function(result) {           
                $('.notification-card.unread').removeClass('unread');
            })
        } else {
            data.then(function(result) {
                console.log('ERROR: ', result);
            });
        }
    });
})

$('.notification-card.unread').click(function() {
    var button = $(this);
    fetch('/mark-as-read/'+ button.data('id'),{
        method: 'POST',
        headers: fetchHeaders,
        credentials: 'same-origin',
    }).then(function(response) {
        var data = response.json();
        if (response.ok) {
            button.toggleClass('unread');
        } else {
            data.then(function(result) {
                console.log('ERROR: ', result);
            });
        }
    });
});

$('.notification-card').find('a').each(function() {
    var href = $(this).attr('href');
    $(this).data('link', href);
    $(this).attr('href', 'javascript:void(0)');
});

$('.notification-card').find('a').click(function() {
    var href = $(this).data('link');
    if ($(this).closest('.notification-card').hasClass('unread')) {
        var button = $(this).closest('.notification-card');
        fetch('/mark-as-read/'+ button.data('id'),{
            method: 'POST',
            headers: fetchHeaders,
            credentials: 'same-origin',
        }).then(function(response) {
            var data = response.json();
            if (response.ok) {
                window.location = href;
            } else {
                data.then(function(result) {
                    console.log('ERROR: ', result);
                });
            }
        });
    } else {
        window.location = href;
    }
});


/*
 * Reviews
 */

// Reply
$('.feedback').find('article').find('a.reply-feedback').click(function() {
    var feedback = $(this).closest('article');
    if ($(this).hasClass('replying')) {
        $(this).removeClass('replying');
        $(this).text('Reply')
        feedback.find('.reply-container:first').hide();
    } else {
        $(this).addClass('replying');
        $(this).text('Cancel reply')
        feedback.find('.reply-container:first').show();
    }
});

// Editor
$('.feedback').find('article').find('a.edit-feedback').click(function() {
    var feedback = $(this).closest('article');
    if ($(this).hasClass('editing')) {
        $(this).removeClass('editing');
        $(this).text('Edit')
        feedback.find('.body:first').show();
        feedback.find('.editor:first').hide();
    } else {
        $(this).addClass('editing');
        $(this).text('Cancel editing')
        feedback.find('.body:first').hide();
        feedback.find('.editor:first').find('textarea:first').val(feedback.find('.body:first').text());
        feedback.find('.editor:first').show();
    }
});

// Delete
$('.feedback').find('article').find('a.delete-feedback').click(function() {
    $(this).hide();
    $(this).closest('article').find('.delete-feedback-confirm:first').show();
});

$('.feedback').find('article').find('a.delete-feedback-no').click(function() {
    $(this).closest('article').find('.delete-feedback:first').show();
    $(this).closest('.delete-feedback-confirm').hide();
});

$('.feedback').find('article').find('a.delete-feedback-yes').click(function() {
    var feedback = $(this).closest('article');
    var formData = new FormData();
    formData.append('id', feedback.data('feedback-id'));
    fetch('/feedback/delete',{
        method: 'POST',
        headers: fetchHeaders,
        credentials: 'same-origin',
        body: formData
    }).then(function(response) {
        var data = response.json();
        if (response.ok) {
            data.then(function(result) {
                feedback.remove();
            })
        } else {
            data.then(function(result) {
                console.log('ERROR: ', result);
            });
        }
    });
});

// Edit Amount on Membership Form

function formatDollar(number) {
    return parseFloat(Math.round(number) / 100).toFixed(2);
}

$('.settings').find('#amount_display').val(formatDollar($('#id_amount').val()));

$('.settings').find('#amount_display').on('keyup', function() {
    $('#id_amount').val($(this).val()*100);
})


// Profile image on Settings
$('html.settings').find('#id_image').change(function() {
    if (this.files.length) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#image_preview').css('background-image', 'url(' + e.target.result + ')');
            $('#image_preview').show();
        }
        reader.readAsDataURL(this.files[0]);
    } else {
        $('#image_preview').hide();
    }
});

// Search button
$('.search-button').click(function() {
    var search = $('body').find('.search');
    search.toggleClass('hide');
    search.find('input').focus();
});

// Voting
$('.shortcut').find('.heart-click').click(function() {
    var button = $(this);
    var formData = new FormData();
    formData.append('id', $(this).closest('.heart').data('id'));
    fetch('/heart',{
        method: 'POST',
        headers: fetchHeaders,
        credentials: 'same-origin',
        body: formData
    }).then(function(response) {
        var data = response.json();
        if (response.ok) {
            data.then(function(result) {
                if (result.success == 'true') {
                    countEl = button.find('span.heart-count')
                    count = parseInt(countEl.text())
                    if (result.hearted == 'true') {
                        countEl.text(count + 1)
                        button.find('span.heart-icon').addClass('has-text-danger');
                        button.addClass('hearted');
                    } else {
                        countEl.text(count - 1)
                        button.find('span.heart-icon').removeClass('has-text-danger');
                        button.removeClass('hearted');
                    }
                }
            })
        } else {
            data.then(function(result) {
                console.log('ERROR: ', result);
            });
        }
    });
});



/*
 * Search Apps
 */
var timeout = null;
$('#app-search').on('keyup', function () {
    var query = $(this).val();
    if (timeout !== null) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(function () {
        if (query != '') {
            searchApps(query);
        } else {
            $('.dropdown-menu.app-search').hide();
        }
    }, 250);
});

function searchApps(query) {
    fetch('https://itunes.apple.com/search?term=' + query + '&country=us&entity=software&limit=10',{
        method: 'GET',
        headers: fetchHeaders,
        credentials: 'same-origin',
    }).then(function(response) {
        var data = response.json();
        if (response.ok) {
            data.then(function(result) {
                var dropdown = $('.dropdown-menu.app-search');
                dropdown.show();
                dropdown.find('.dropdown-item').not('.template').remove();
                var template = dropdown.find('.template');
                $.each(result.results, function() {
                    var r = $(template).clone();
                    $(r).attr('data-id', this.trackId);
                    $(r).find('img').attr('src', this.artworkUrl60);
                    $(r).find('.name').text(this.trackName);
                    $(r).find('.category').text(this.primaryGenreName);
                    $(r).find('.seller').text(this.sellerName);
                    $(r).removeClass('template');
                    $(r).appendTo(dropdown.find('.dropdown-content'));
                });
                $(dropdown).find('.dropdown-item').click(function() {
                    var id = $(this).data('id');
                    var name = $(this).find('.name').text();
                    var image = $(this).find('img').attr('src');
                    var category = $(this).find('.category').text();
                    getApp(id, name, image, category);
                });
            });
        } else {
            data.then(function(result) {
                console.log('ERROR: ', result);
            });
        }
    });
}

function getApp(id, name=null, image=null, category=null) {
    if(typeof id !== "undefined") {
        var formData = new FormData();
        formData.append('id', id);
        formData.append('name', name);
        formData.append('image', image);
        formData.append('category', category);
        fetch('/get-app',{
            method: 'POST',
            headers: fetchHeaders,
            credentials: 'same-origin',
            body: formData
        }).then(function(response) {
            var data = response.json();
            if (response.ok) {
                data.then(function(result) {
                    if ($('#id_apps, #id_app').find('option[value=' + result.id + ']').length == 0) {
                        $('#id_apps, #id_app').append($('<option>', {
                            value: result.id,
                            text: result.name
                        }));
                    }
                    $('#id_apps, #id_app').find('option[value=' + result.id + ']').prop('selected', true);
                    var apps = $('.apps.columns');
                    var template = apps.find('.app.template');
                    var r = $(template).clone();
                    $(r).attr('data-id', result.id);
                    $(r).find('img').attr('src', result.image);
                    $(r).find('.name').text(result.name);
                    $(r).find('.category').text(result.category);
                    $(r).removeClass('template');
                    $(r).appendTo(apps);
                    $('.dropdown-menu.app-search').hide();
                    $('#app-search').val('');
                    if ($('#appSearchBox').hasClass('single')) {
                        $('#app-search').hide();
                        $('#appSearchBox .help').hide();
                    }
                    $('.app').find('.delete').click(function() {
                        removeApp($(this).closest('.app'));
                    });
                });
            } else {
                data.then(function(result) {
                    console.log('ERROR: ', result);
                });
            }
        });
    }
}

$('.app').find('.delete').click(function() {
    removeApp($(this).closest('.app'));
});

function removeApp(app) {
    $('#id_apps, #id_app').find('option[value=' + app.data('id') + ']').prop('selected', false);
    app.remove();
    $('#app-search').show();
    $('#appSearchBox .help').show();
}

$('.dropdown').find('button').click(function() {
    $(this).closest('.dropdown').toggleClass('is-active');
});

$('.notifications-button').click(function() {
    $(this).closest('.has-dropdown').toggleClass('is-active');
});

/*
 * Advertising Form
 */
if ($('html').hasClass('advertising')) {
    getApp(getUrlParameter('app'));
    $('#id_email').val(getUrlParameter('email'));
    $('#id_brief').val(getUrlParameter('brief'));
    newurl = removeUrlParameter(window.location.href, 'app');
    newurl = removeUrlParameter(newurl, 'email');
    newurl = removeUrlParameter(newurl, 'brief');
    window.history.pushState({path:newurl},'',newurl);
}

/*
 * Messages
 */

/* Shortcuts */
if ($('html').hasClass('shortcut') && getUrlParameter('created')) {
    showMessage('success', 'Shortcut created', 
                'Your shortcut has been created.'
    );
    newurl = removeUrlParameter(window.location.href, 'created');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('updated')) {
    showMessage('success', 'Shortcut updated', 
                'Your shortcut has been updated.'
    );
    newurl = removeUrlParameter(window.location.href, 'updated');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('published')) {
    showMessage('success', 'Shortcut published', 
                'Your shortcut has been published.'
    );
    newurl = removeUrlParameter(window.location.href, 'published');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('unpublished')) {
    showMessage('success', 'Shortcut unpublished', 
                'Your shortcut has been unpublished.'
    );
    newurl = removeUrlParameter(window.location.href, 'unpublished');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('profile') && getUrlParameter('shortcut-deleted')) {
    showMessage('success', 'Shortcut deleted', 
                'Your shortcut has been deleted.'
    );
    newurl = removeUrlParameter(window.location.href, 'shortcut-deleted');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('feedback-posted')) {
    showMessage('success', 'Feedback posted', 
                'Your feedback has been posted.'
    );
    newurl = removeUrlParameter(window.location.href, 'feedback-posted');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('feedback-edited')) {
    showMessage('success', 'Feedback edited', 
                'Your feedback has been edited.'
    );
    newurl = removeUrlParameter(window.location.href, 'feedback-edited');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('feedback-deleted')) {
    showMessage('success', 'Feedback deleted', 
                'Your feedback has been deleted.'
    );
    newurl = removeUrlParameter(window.location.href, 'feedback-deleted');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('reported')) {
    showMessage('success', 'Shortcut reported', 
                'You have reported this Shortcut. We will review your report.'
    );
    newurl = removeUrlParameter(window.location.href, 'reported');
    window.history.pushState({path:newurl},'',newurl);
}

/* Shortcut Versions */
if ($('html').hasClass('shortcut') && getUrlParameter('version-created')) {
    showMessage('success', 'Version created', 
                'Your shortcut version has been created.'
    );
    newurl = removeUrlParameter(window.location.href, 'version-created');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('version-updated')) {
    showMessage('success', 'Version updated', 
                'Your shortcut version has been updated.'
    );
    newurl = removeUrlParameter(window.location.href, 'version-updated');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('shortcut') && getUrlParameter('version-deleted')) {
    showMessage('success', 'Version deleted', 
                'Your shortcut version has been deleted.'
    );
    newurl = removeUrlParameter(window.location.href, 'version-deleted');
    window.history.pushState({path:newurl},'',newurl);
}

/* Accounts */
if ($('html').hasClass('home') && getUrlParameter('logged-out')) {
    showMessage('success', 'Logged out', 
                'You have logged out. See you later!'
    );
    newurl = removeUrlParameter(window.location.href, 'logged-out');
    window.history.pushState({path:newurl},'',newurl);
}

/* Settings */
if ($('html').hasClass('settings') && getUrlParameter('account-settings-saved')) {
    showMessage('success', 'Settings Saved', 
                'Your account settings have been updated'
    );
    newurl = removeUrlParameter(window.location.href, 'account-settings-saved');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('membership') && getUrlParameter('membership-started')) {
    showMessage('success', 'Membership Started', 
                'Your Membership has been started. Enjoy your new perks!'
    );
    newurl = removeUrlParameter(window.location.href, 'membership-started');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('settings') && getUrlParameter('payment-info-updated')) {
    showMessage('success', 'Payment Information Updated', 
                'Your Membership payment information has been updated'
    );
    newurl = removeUrlParameter(window.location.href, 'payment-info-updated');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('settings') && getUrlParameter('membership-cancelled')) {
    showMessage('success', 'Membership Canccelled', 
                'Your Membership has been cancelled.'
    );
    newurl = removeUrlParameter(window.location.href, 'membership-cancelled');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('settings') && getUrlParameter('membership-renewed')) {
    showMessage('success', 'Membership Renewed', 
                'Your Membership has been renewed.'
    );
    newurl = removeUrlParameter(window.location.href, 'membership-renewed');
    window.history.pushState({path:newurl},'',newurl);
}

/* Pins */
if ($('html').hasClass('profile') && getUrlParameter('pin-added')) {
    showMessage('success', 'Shortcut Pinned', 
                'Shortcut has been pinned to your profile.'
    );
    newurl = removeUrlParameter(window.location.href, 'pin-added');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').hasClass('profile') && getUrlParameter('pin-removed')) {
    showMessage('success', 'Pin Removed', 
                'Shortcut has been unpinned from your profile.'
    );
    newurl = removeUrlParameter(window.location.href, 'pin-removed');
    window.history.pushState({path:newurl},'',newurl);
}

/* Support message sent */
if ($('html').hasClass('support') && getUrlParameter('support-message-sent')) {
    showMessage('success', 'Message Sent', 
                'Thanks for your message! Please allow 24 hours for a response.'
    );
    newurl = removeUrlParameter(window.location.href, 'support-message-sent');
    window.history.pushState({path:newurl},'',newurl);
}

/* Advertisement created */
if ($('html').hasClass('advertising') && getUrlParameter('submitted')) {
    showMessage('success', 'Message Sent', 
                'Your ad has been submitted! Please allow 24 hours for a response.'
    );
    newurl = removeUrlParameter(window.location.href, 'submitted');
    window.history.pushState({path:newurl},'',newurl);
}

/* Moderation */
if ($('html').is('.review-board, .shortcut, .shortcut-changelog') && getUrlParameter('shortcut-version-approved')) {
    showMessage('success', 'Shortcut Approved', 
                'You have have approved this shortcut.'
    );
    newurl = removeUrlParameter(window.location.href, 'shortcut-version-approved');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').is('.review-board, .shortcut, .shortcut-changelog') && getUrlParameter('shortcut-version-rejected')) {
    showMessage('success', 'Shortcut Version Rejected', 
                'You have have rejected the most recent verstion of the shortcut.'
    );
    newurl = removeUrlParameter(window.location.href, 'shortcut-version-rejected');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').is('.review-board, .shortcut, .shortcut-changelog') && getUrlParameter('shortcut-rejected')) {
    showMessage('success', 'Shortcut Rejected', 
                'You have have rejected all verstions of the shortcut.'
    );
    newurl = removeUrlParameter(window.location.href, 'shortcut-rejected');
    window.history.pushState({path:newurl},'',newurl);
}
if ($('html').is('.review-board, .shortcut, .shortcut-changelog') && getUrlParameter('shortcut-deleted')) {
    showMessage('success', 'Shortcut Marked for Deletion', 
                'You have marked the shortcut for deletion.'
    );
    newurl = removeUrlParameter(window.location.href, 'shortcut--deleted');
    window.history.pushState({path:newurl},'',newurl);
}

/*
 * Show message
 * ------------
 * severity - The severity of the message. Determines the color
 *            using Bulma classing. Options include info, success, 
 *            warning, danger. Can also can use dark, primary, link
 * title    - Title of the message
 * body     - Body of the message
 */
function showMessage(severity, title, body) {
    name = severity || '';
    var popUp = $('article.message.pop-up');
    if (severity) {
        $(popUp).addClass('is-' + severity);
    }
    $(popUp).find('.message-title').text(title);
    $(popUp).find('.message-body').text(body);
    setTimeout(function() {
        $(popUp).addClass('show');
    }, 500);
    setTimeout(function() {
        $(popUp).removeClass('show');
    }, 7500)
}

/* Hide message when x button is clicked */
$('article.message.pop-up').find('button.delete').click(function() {
    $(this).closest('article.message.pop-up').removeClass('show');
});

/*
 * Menu
 */
$('.navbar-burger').click(function() {
    $(this).toggleClass('is-active');
    $(this).closest('.navbar').find('.navbar-menu').toggleClass('is-active');
});

/*
 * Resize text to fit div
 * Reference: https://coderwall.com/p/_8jxgw/autoresize-text-to-fit-into-a-div-width-height
 */

$('.auto-size-text').each(function() {
    while(this.scrollWidth > this.offsetWidth) {
        var newFontSize = (parseFloat($(this).css('font-size').slice(0, -2)) * 0.95) + 'px';
        $(this).css('font-size', newFontSize);
    }
});