<?php

N2Loader::import('libraries.slider.generator.N2SmartSliderGeneratorAbstract', 'smartslider');

class N2GeneratorAllinOneEventCalendarEvents extends N2GeneratorAbstract
{

    private $where = array();

    protected function _getData($count, $startIndex) {


        $tax_query  = array();
        $meta_query = array();

        $categories = explode('||', $this->data->get('categories', 0));
        if (!in_array(0, $categories)) {
            $tax_query[] = array(
                'taxonomy' => 'events_categories',
                'field'    => 'term_id',
                'terms'    => $categories
            );
        }

        $tags = explode('||', $this->data->get('tags', 0));
        if (!in_array(0, $tags)) {
            $tax_query[] = array(
                'taxonomy' => 'events_tags',
                'field'    => 'term_id',
                'terms'    => $tags
            );
        }

        $today = strtotime(date('Y-m-d', current_time('timestamp')));

        switch ($this->data->get('started', '0')) {
            case 1:
                $this->where[] = 'events.start < ' . $today;
                break;
            case -1:
                $this->where[] = 'events.start >= ' . $today;
                break;
        }

        switch ($this->data->get('ended', '-1')) {
            case 1:
                $this->where[] = 'events.end < ' . $today;
                break;
            case -1:
                $this->where[] = 'events.end >= ' . $today;
                break;
        }

        $args = array(
            'offset'           => $startIndex,
            'posts_per_page'   => $count,
            'post_parent'      => '',
            'post_status'      => 'publish',
            'suppress_filters' => false,
            'post_type'        => 'ai1ec_event',
            'tax_query'        => $tax_query,
            'meta_query'       => $meta_query
        );

        $order = explode("|*|", $this->data->get('order', 'start|*|asc'));

        $args['orderby'] = $order[0];
        $args['order']   = $order[1];


        add_filter('posts_fields', array(
            $this,
            'posts_fields'
        ));
        add_filter('posts_where', array(
            $this,
            'posts_where'
        ));
        add_filter('posts_join', array(
            $this,
            'posts_join'
        ));
        $posts_array = get_posts($args);
        remove_filter('posts_fields', array(
            $this,
            'posts_fields'
        ));
        remove_filter('posts_where', array(
            $this,
            'posts_where'
        ));
        remove_filter('posts_join', array(
            $this,
            'posts_join'
        ));

        $data = array();

        for ($i = 0; $i < count($posts_array); $i++) {
            $event = $posts_array[$i];

            $data[$i]['title']       = $event->post_title;
            $data[$i]['description'] = $event->post_content;
            $data[$i]['image']       = N2ImageHelper::dynamic(wp_get_attachment_url(get_post_thumbnail_id($event->ID)));
            $thumbnail               = wp_get_attachment_image_src(get_post_thumbnail_id($event->ID, 'thumbnail'));
            if ($thumbnail[0]) {
                $data[$i]['thumbnail'] = N2ImageHelper::dynamic($thumbnail[0]);
            } else {
                $data[$i]['thumbnail'] = $data['image'];
            }
            $data[$i]['url'] = get_permalink($event->ID);

            $data[$i]['start_date'] = date_i18n(get_option('date_format'), $event->start);
            $data[$i]['start_time'] = date_i18n(get_option('time_format'), $event->start);

            $data[$i]['end_date'] = date_i18n(get_option('date_format'), $event->end);
            $data[$i]['end_time'] = date_i18n(get_option('time_format'), $event->end);

            $data[$i]['ID'] = $event->ID;

            $data[$i]['timezone_name'] = $event->timezone_name;
            $data[$i]['venue']         = $event->venue;
            $data[$i]['country']       = $event->country;
            $data[$i]['address']       = $event->address;
            $data[$i]['city']          = $event->city;
            $data[$i]['province']      = $event->province;
            $data[$i]['postal_code']   = $event->postal_code;
            $data[$i]['contact_name']  = $event->contact_name;
            $data[$i]['contact_phone'] = $event->contact_phone;
            $data[$i]['contact_email'] = $event->contact_email;
            $data[$i]['contact_url']   = $event->contact_url;
            $cost                      = unserialize($event->cost);
            if ($cost['is_free']) {
                $data[$i]['cost'] = 0;
            } else {
                $data[$i]['cost'] = $cost['cost'];
            }
            $data[$i]['ticket_url'] = $event->ticket_url;
            $data[$i]['latitude']   = round($event->latitude, 6);
            $data[$i]['longitude']  = round($event->longitude, 6);

        }

        return $data;
    }

    public function posts_fields($fields) {
        return $fields . ', events.*';
    }

    public function posts_join($join) {
        global $wpdb;

        return $join . "LEFT JOIN {$wpdb->prefix}ai1ec_events AS events ON $wpdb->posts . ID = events.post_id ";
    }

    public function posts_where($where) {
        if (count($this->where)) {
            $where .= ' AND ' . implode(' AND ', $this->where) . ' ';
        }
        return $where;
    }

}
